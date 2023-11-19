import eWelink, { Device } from "ewelink-api";
import { LogData } from "../datasets/log-data";
import { DbHelper } from "./db-helper";

require("dotenv").config();

export class SmartHomeHelper {
  protected connection: eWelink;
  protected devices: Device[];
  protected socket: any;
  protected lastData: LogData;
  protected dbHelper: DbHelper;
  protected deviceId: string;
  protected interval: number;

  async init(): Promise<void> {
    this.dbHelper = new DbHelper();
    await this.dbHelper.initAsync();

    this.deviceId = process.env.EWELINK_DEVICE_ID || '1001e2b7f9';
    this.interval = parseInt(process.env.EWELINK_INTERVAL || '30');

    this.connection = new eWelink({
      region: 'cn',
      phoneNumber: process.env.EWELINK_PHONE_NUMBER || '+6285313827050',
      password: process.env.EWELINK_PASSWORD || 'ModeShoes1235',
      APP_ID: process.env.EWELINK_APP_ID || 'YFHIVQ5flSlZO8qA5a31zLSJYgqC8N9A',
      APP_SECRET: process.env.EWELINK_APP_SECRET || 'OaOP6GMSNCrrSrnBC72V1ivWfll2Y6aQ'
    } as any);

    this.devices = await this.connection.getDevices();
  }

  async openWebSocketAndListen(): Promise<void> {
    this.socket = await this.connection.openWebSocket(async data => {
      console.log(data);
      const params = data?.["params"]
      if (!params) return;

      const { current, voltage } = params;
      if ((current || 0) == 0) return;

      const logData = new LogData(current, voltage, true);
      await this._record(logData);
    });

    this.socket.on("error", (error: any) => {
      console.log(`Err:${error}`);
    });
  }

  async start(): Promise<void> {
    setInterval(async () => {
      if (!this.socket?.isOpened) {
        console.log("Reconnecting websocket ...")
        this.socket?.close();
        await this.openWebSocketAndListen()
      }
      const device = await this.connection.getDevice(this.deviceId);
      const params = device?.params as any;
      if (!params) return;

      const { current, voltage } = params;
      if ((current || 0) == 0) return;

      const logData = new LogData(current, voltage);
      await this._record(logData);
    }, 1000 * this.interval);
  }

  _record(data: LogData) {
    data.log();
    if (data.equals(this.lastData)) return;
    this.dbHelper.log(data);
    this.lastData = data;
  }
}
