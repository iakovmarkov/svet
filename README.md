# Svet
Svet is a tiny Telegram bot, a GraphQL Server and a React Native app to manage Playbulb smart lightning devices.
It uses Bluteooth LE to send commands to them, and can control multiple devices at the same time.

## Supported devices
* MIPOW Playbulb Sphere
* MIPOW Playbulb Comet
* MIPOW Smart Bulb

## Supported bot commands
* `/help` - This help message
* `/on` - Turns on all lights
* `/off` - Turns off all lights
* `/set $COLOR` - Sets the lights to specified color
* `/devices` - Lists connected devices
* `/reconnect` - Tries to reconnect to all devices
* `/colors` - Lists known colors

## Configuring
* Get an Telegram bot token [here](https://core.telegram.org/bots#6-botfather)
* Ensure that your NodeJS is properly configured
* Copy `.env.example` file to `.env` and insert your bot token & telegram username
* Done :tada:

## Running
Run the following command:

    npm start
    
This should start Svet bot and/or GraphQL server :sparkles:

### Running without root permissions
Run the following command:

    sudo setcap cap_net_raw,capcap_net_bind_service+eip $(eval readlink -f `which node`)

This grants the node binary cap_net_raw privileges, so it can start/stop BLE advertising.

### Using Systemd to ensure that app is always running
Copy `svet.service` into `/etc/systemd/system/svet.service`, and modify the environment variables.

## Requirements
* `node` v8.0.0
* A bluetooth adapter

## Credits
App photo by Jake Fagan on Unsplash