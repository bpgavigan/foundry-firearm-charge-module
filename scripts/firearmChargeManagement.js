// Hook to automatically set the firearm flag when the item is created in an actor's inventory
Hooks.on("createItem", async (item, options, userId) => {
    const actor = item.actor;

    // Ensure the item and actor exist
    if (!actor || !item) return;

    // Check if the item being created is the "RHC Basic Issue Pistol"
    if (item.name === "RHC Basic Issue Pistol") {
        console.log(`Setting firearm flag for ${item.name} on actor ${actor.name}`);

        // Set the firearm-charge-management flag for the item
        await item.setFlag("firearm-charge-management", "isFirearm", true);

        console.log(`${item.name} flagged as a firearm for actor ${actor.name}`);
    }
});

// Firearm charge management logic
Hooks.on("midi-qol.preItemRoll", async (workflow) => {
    const item = workflow.item;
    const actor = item.actor;

    // Check if the item has the firearm management flag set
    const isFirearm = item.getFlag("firearm-charge-management", "isFirearm");
    if (!isFirearm) return true;

    // Get the current charges (ammo/uses)
    let currentCharges = item.system.uses.value;

    // If no charges are left, prompt the user to reload and prevent the item roll
    if (currentCharges <= 0) {
        await showReloadDialog(actor, item);
        return false;  // Prevent the item roll
    }

    // Decrement the charge by 1 and allow the item roll to proceed
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
