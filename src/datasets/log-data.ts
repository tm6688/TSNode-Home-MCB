import moment from "moment";

export class LogData {
  constructor(public current: number, public voltage: number, public webSocket: boolean = false) {
  }

  equals(other: LogData): boolean {
    return this.current === (other?.current || 0) && this.voltage === (other?.voltage || 0);
  }

  log(): void {
    console.log(moment().format("MMM-DD HH:mm:ss"), this.webSocket ? "ws" : "", `current: ${this.current}, voltage: ${this.voltage}`);
  }
}