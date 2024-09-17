// Hook to automatically set the firearm flag when the item is created in an actor's inventory
Hooks.on("createItem", async (item, options, userId) => {
    const actor = item.actor;

    // Ensure the item and actor exist
    if (!actor || !item) return;

    // List of muzzle-loading firearms that should trigger the flag
    const muzzleLoaders = [
        "RHC Basic Issue Pistol", 
        "Carbine", 
        "Musket", 
        "Pistol", 
        "Rifled Carbine", 
        "Rifled Musket", 
        "Shotgun", 
        "Target Pistol", 
        "Pistol, Poorly Made"
    ];

    // Check if the item being created is one of the muzzle-loading firearms
    if (muzzleLoaders.includes(item.name)) {
        console.log(`Setting firearm flag for ${item.name} on actor ${actor.name}`);

        // Set the firearm-charge-management flag for the item
        await item.setFlag("firearm-charge-management", "isFirearm", true);

        console.log(`${item.name} flagged as a firearm for actor ${actor.name}`);
    }
});

// Firearm charge management and misfire logic
Hooks.on("midi-qol.preItemRoll", async (workflow) => {
    const item = workflow.item;
    const actor = item.actor;

    // Check if the item has the firearm management flag set
    const isFirearm = foundry.utils.getProperty(item.flags, "firearm-charge-management.isFirearm"); // Fixed deprecated method
    if (!isFirearm) return true;

    // Debug: Log weapon details and the roll state
    console.log(`Firing ${item.name} by ${actor.name}.`);
    console.log("Roll Information: ", workflow.attackRoll);
    console.log("Advantage: ", workflow.advantage, " Disadvantage: ", workflow.disadvantage);

    // Check for magical firearms, which never misfire
    const isMagical = item.rarity === "magical";
    if (isMagical) {
        console.log(`${item.name} is magical, skipping misfire checks.`);
        return true;  // Skip misfire mechanics for magical firearms
    }

    // Get the current charges (ammo/uses)
    let currentCharges = item.system.uses?.value || 0;

    // If no charges are left, prompt the user to reload and prevent the item roll
    if (currentCharges <= 0) {
        console.log(`${item.name} is out of charges, prompting reload.`);
        await showReloadDialog(actor, item);
        return false;  // Prevent the item roll
    }

    // Handle misfire mechanic
    const roll = workflow.attackRoll;
    const hasDisadvantage = workflow.disadvantage;

    if (roll.total === 1) {
        if (hasDisadvantage) {
            // If the attack was made with disadvantage and rolled a 1, the barrel cracks
            console.log(`${item.name} misfired with disadvantage. Barrel cracked.`);
            ui.notifications.error(`${item.name} has misfired and the barrel has cracked! It is unusable until repaired.`);
            await item.update({ "system.equipped": false }); // Unequip the item
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: `${actor.name}'s ${item.name} misfired and the barrel cracked! It requires a day of work with a gun kit or a use of *mending* to repair.`
            });
        } else {
            // If no disadvantage, it's a regular misfire and needs to be cleared
            console.log(`${item.name} misfired. Barrel needs clearing.`);
            ui.notifications.warn(`${item.name} misfired! Use an action to clear the barrel with a gun kit.`);
            await item.update({ "system.uses.value": currentCharges - 1 }); // Decrement ammo as the shot is consumed
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: `${actor.name}'s ${item.name} misfired! The barrel must be cleared before it can be fired again.`
            });
        }
        return false;  // Prevent the attack from proceeding
    }

    // Decrement the charge by 1 and allow the item roll to proceed
    console.log(`Firing successful. ${item.name} now has ${currentCharges - 1} charges left.`);
    await item.update({ "system.uses.value": currentCharges - 1 });
    return true;  // Allow the item roll to proceed
});

// Function to display reload dialog
async function showReloadDialog(actor, item) {
    return new Promise((resolve) => {
        new Dialog({
            title: "Reload Required",
            content: `<p>Your ${item.name} is out of ammo. Do you want to reload?</p>`,
            buttons: {
                yes: {
                    label: "Yes, Reload",
                    callback: async () => {
                        // Reset the ammo to maximum charges
                        await item.update({ "system.uses.value": item.system.uses.max });
                        ui.notifications.info(`${actor.name} has reloaded their ${item.name}.`);
                        postReloadMessage(actor, item, true);
                        resolve();
                    },
                    icon: `<i class="fas fa-check"></i>`
                },
                no: {
                    label: "No, Cancel",
                    callback: () => {
                        ui.notifications.info(`${actor.name} chose not to reload.`);
                        postReloadMessage(actor, item, false);
                        resolve();
                    },
                    icon: `<i class="fas fa-times"></i>`
                }
            },
            default: "yes",
            close: resolve
        }).render(true);
    });
}

// Function to post the reload action to chat
function postReloadMessage(actor, item, didReload) {
    let messageContent = `
        <div class="dnd5e chat-card">
            <header class="card-header">
                <img src="${item.img}" title="${item.name}" width="36" height="36">
                <h3>${item.name}</h3>
            </header>
            <div class="card-content">
                <p>${actor.name} has ${didReload ? "reloaded" : "decided not to reload"} their ${item.name}.</p>
            </div>
        </div>
    `;

    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: messageContent,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });
}
