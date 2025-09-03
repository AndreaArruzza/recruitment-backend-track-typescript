import CryptoJs from "crypto-js";
import { Prisma } from "@prisma/client";



const cryptoKey = process.env.CRYPTO_KEY || "mysecretkey";

export class SharedMapper {

  static getDecryptedValue = (encryptedValue: string) => {
    const bytes = CryptoJs.AES.decrypt(encryptedValue, cryptoKey);
    return bytes.toString(CryptoJs.enc.Utf8);
  };


   static encryptAES = (value: string) => {
    const bytes =  CryptoJs.AES.encrypt(value, cryptoKey).toString();
  };


  static convertId = (id: string): bigint => {
    return BigInt(this.getDecryptedValue(id));
  }


   static parseBigInt(v?: string | number | bigint | null): bigint | undefined {
      if (v === null || v === undefined) return undefined;
      if (typeof v === "bigint") return v;
      if (typeof v === "number") return BigInt(v);
      const s = String(v).trim();
      if (!/^-?\d+$/.test(s)) return undefined;
      try {
        return BigInt(s);
      } catch {
        return undefined;
      }
    }
  
    static parseDate(v?: string | Date | null): Date | undefined {
      if (v === null || v === undefined) return undefined;
      const d = v instanceof Date ? v : new Date(v);
      return isNaN(d.getTime()) ? undefined : d;
    }
  
    static parseDecimal(v?: string | number | Prisma.Decimal | null): Prisma.Decimal | undefined {
      if (v === null || v === undefined) return undefined;
      if (v instanceof Prisma.Decimal) return v;
      return new Prisma.Decimal(v as any);
    }
}
