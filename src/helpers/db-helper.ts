import mysql from "mysql2/promise";
import { LogData } from "../datasets/log-data";

require("dotenv").config();

export class DbHelper {
  protected connection: mysql.Connection;

  async initAsync(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'smart_home',
      password: process.env.DB_PASSWORD || 'trendy',
      timezone: '+07:00',
    });
  }

  async log(data: LogData, retry: number = 0): Promise<void> {
    try {
      const sql = `INSERT INTO mcb_logs (current, voltage) VALUES (${data.current}, ${data.voltage})`;
      await this.connection.execute(sql);
    } catch (error) {
      console.log(error);
      if (retry < 3) {
        console.log('Reconnecting to database')
        await this.initAsync();
        await this.log(data, retry + 1);
      } else {
        console.log('Failed to log to database')
      }
    }
  }
}