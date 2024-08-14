# Foundry Firearm Charge Management Module

## Overview

This Foundry VTT module provides automatic charge management for firearms within your game, specifically targeting items like the "RHC Basic Issue Pistol". The module ensures that firearms are properly checked for charges before allowing an attack, prompting the user to reload if the firearm is out of ammo.

### Features

- **Automatic Charge Check:** Before each attack, the module checks if the firearm has any remaining charges.
- **Reload Prompt:** If the firearm is out of charges, a dialog box will appear asking the player if they want to reload.
- **Charge Decrement:** When an attack is made with sufficient charges, the module automatically decrements the charge count.
- **Chat Notifications:** The module posts a message in chat to inform other players about the reloading action.

## Installation

1. **Using Manifest URL:**
   - To install the module in Foundry VTT, use the following manifest URL:
     ```
     https://yourusername.github.io/foundry-firearm-charge-module/module.json
     ```

2. **Manual Installation:**
   - Alternatively, you can download the repository as a ZIP file and extract it into your Foundry VTT `modules` directory.

3. **Activate the Module:**
   - Go to `Game Settings` -> `Manage Modules` in Foundry VTT.
   - Find `Foundry Firearm Charge Management` in the list and activate it.

## Usage

### Setting Up

1. **Configure the Firearm Item:**
   - Ensure your firearm item, such as "RHC Basic Issue Pistol," is correctly set up with charges under the `Uses` section in the item configuration.

2. **Automatic Charge Management:**
   - When a player uses the firearm, the module will automatically check the charges. If the firearm is out of charges, a dialog box will appear prompting the player to reload.

3. **Stopping an Attack Roll:**
   - If the firearm has no remaining charges and the player chooses not to reload, the attack roll is canceled, preventing the player from making an attack without ammo.

### Example

When a player uses the "RHC Basic Issue Pistol":
- **With Charges:** The firearm's charge count is decremented by one, and the attack proceeds.
- **Without Charges:** The player is prompted to reload. If they reload, the charges are reset, and a notification is posted in chat.

## Compatibility

- **Foundry VTT Version:** 10+
- **System Compatibility:** Designed to work with D&D 5e but can be adapted to other systems that use item charges.

## Contributing

Contributions to improve the module are welcome! Feel free to fork this repository, make your changes, and submit a pull request.

## License

This module is released under the MIT License.