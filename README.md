# Svet
Svet is a tiny Telegram bot to manage Playbulb smart lightning devices.
It uses Bluteooth LE to send commands to them, and can control multiple devices at the same time.

## Supported devices
* MIPOW Playbulb Sphere
* MIPOW Playbulb Comet
* MIPOW Smart Bulb

## Supported commands
* `/help` - This help message
* `/on` - Turns on all lights
* `/off` - Turns off all lights
* `/set` - Sets the lights to specified color
* `/devices` - Lists connected devices
* `/colors` - Lists known colors
* `/restart` - Restarts the bot and reconnects to all lights

## Configuring
* Set up a Telegram bot [here](https://core.telegram.org/bots#6-botfather). Remember the token, you'll need it later.
* Ensure that your bluetooth is properly configured.
* Copy `.env.example` file to `.env` and insert your bot token & telegram username.
* Done :tada:

## Running
Run the following command:

    npm start
    
This should start your bot that will listen to commands and do it's magic :sparkles:

### Running without root permissions
Run the following command:

    sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

This grants the node binary cap_net_raw privileges, so it can start/stop BLE advertising.

### Using `pm2` to ensure that bot is always running
Run the following command:

    pm2 start npm --name svet -- start
 
You can read more about pm [here](https://github.com/Unitech/pm2).
A great guide by DigitalOcean can be found [here](https://www.digitalocean.com/community/tutorials/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps).

## Dependencies
* `node` v8.0.0 or higher
* A bluetooth adapter
