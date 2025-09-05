import CryptoJS from "crypto-js";

/**
 * 加密工具类
 */
export class EncryptionUtil {
  // 加密密钥（在实际项目中，应该从环境变量中获取）- 16字节
  private static readonly SECRET_KEY = "game9_secret_key";

  /**
   * AES加密
   * @param data 要加密的数据
   * @returns 加密后的数据
   */
  public static encrypt(data: string): string {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.SECRET_KEY);
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    } catch (error) {
      console.error("加密失败:", error);
      return data; // 加密失败时返回原始数据
    }
  }

  /**
   * AES解密
   * @param encryptedData 加密的数据
   * @returns 解密后的数据
   */
  public static decrypt(encryptedData: string): string {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.SECRET_KEY);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("解密失败:", error);
      return encryptedData; // 解密失败时返回加密数据
    }
  }

  /**
   * SHA256哈希
   * @param data 要哈希的数据
   * @returns 哈希值
   */
  public static hash(data: string): string {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error("哈希计算失败:", error);
      return data; // 哈希计算失败时返回原始数据
    }
  }
}
