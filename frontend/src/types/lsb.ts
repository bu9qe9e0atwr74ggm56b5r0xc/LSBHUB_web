export type LsbMethod = 'linear' | 'key' | 'adaptive';

export type Channel = 'R' | 'G' | 'B' | 'A';

export interface LsbParams {
  method: LsbMethod;
  bitsCount: number;
  channels: Channel[];
  useKey: boolean;
  key: string;
  randomChannelOrder: boolean;
}

export interface ImageFile {
  file: File;
  preview: string; // base64
  width: number;
  height: number;
  format: string;
  name: string;
}

export interface OperationResult {
  stegoImageUrl: string;    // URL или base64 стегоизображения
  mse: number;
  psnr: number;
  modifiedPixels: number;
  wasConverted: boolean;    // был ли JPEG сконвертирован в PNG
  operationId: string;
}

export interface DecodeResult {
  extractedText: string;
  operationId: string;
}

export interface Capacity {
  bytes: number;
  chars: number; // приблизительно для ASCII
}