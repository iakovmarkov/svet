const debug = require("debug")("svet:bluetooth");
const noble = require("noble");

noble.on("stateChange", () => debug("Bluetooth state changed to", noble.state));
noble.on("scanStart", () => debug("Bluetooth started scan"));
noble.on("warning", e => debug("Bluetooth warn:", e));

noble.on("discover", peripheral => {
  const name =
    typeof peripheral.advertisement.localName !== "undefined"
      ? `(${peripheral.advertisement.localName})`
      : "";
  debug(`Bluetooth discovered: ${peripheral.uuid} ${name}`);
});

const powerNoble = () =>
  new Promise(resolve => {
    if (noble.state === "poweredOn") {
      debug("noble powered on");
      resolve();
      return;
    }

    debug("Awaiting Bluetooth power state...");
    noble.on("stateChange", () => {
      if (noble.state === "poweredOn") {
        resolve();
      }
    });
  });

const read = (device, handle) =>
  new Promise((resolve, reject) => {
    device.readHandle(handle, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });

const write = (device, handle, data) =>
  new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(data);
    }
    debug(`Writing ${data} to ${handle} (${device.advertisement.localName})`);
    device.writeHandle(
      handle,
      data,
      true /* write without waiting for response */,
      error => {
        if (error) {
          reject(error);
        }
        resolve();
      }
    );
  });

const connect = device =>
  new Promise(async resolve => {
    try {
      await device.connect()
      resolve()
    } catch (e) {
      console.error("Connecting to device failed", e)
    }
  })

const startScan = bt =>
  new Promise(resolve => {
    debug("Awaiting Bluetooth scan start...");
    bt.startScanning();
    bt.on("scanStart", () => {
      resolve();
    });
  });

const initBluetooth = () =>
  new Promise(async resolve => {
    if (noble.state !== "poweredOn") {
      debug("Initializing Bluetooth...");
      await powerNoble();
    }
    debug("Bluetooth on, scanning...");
    resolve(noble);
  });

module.exports = {
  initBluetooth,
  startScan,
  connect,
  read,
  write
};
