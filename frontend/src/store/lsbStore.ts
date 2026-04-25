import { create } from 'zustand';
import type {
  LsbParams,
  ImageFile,
  OperationResult,
  DecodeResult,
  Capacity,
} from '../types/lsb';

interface LsbState {
  // Параметры метода
  params: LsbParams;
  setParams: (params: Partial<LsbParams>) => void;
  resetParams: () => void;

  // Загруженное изображение
  imageFile: ImageFile | null;
  setImageFile: (file: ImageFile | null) => void;

  // Ёмкость изображения при текущих параметрах
  capacity: Capacity | null;
  setCapacity: (capacity: Capacity | null) => void;

  // Текст для встраивания
  message: string;
  setMessage: (message: string) => void;

  // Результат операции encode
  encodeResult: OperationResult | null;
  setEncodeResult: (result: OperationResult | null) => void;

  // Результат операции decode
  decodeResult: DecodeResult | null;
  setDecodeResult: (result: DecodeResult | null) => void;

  // Состояние загрузки
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Ошибка
  error: string | null;
  setError: (error: string | null) => void;

  // Сброс всего состояния операции
  resetOperation: () => void;
}

const DEFAULT_PARAMS: LsbParams = {
  method: 'linear',
  bitsCount: 1,
  channels: ['R', 'G', 'B'],
  useKey: false,
  key: '',
  randomChannelOrder: false,
};

export const useLsbStore = create<LsbState>((set) => ({
  params: DEFAULT_PARAMS,
  setParams: (partial) =>
    set((state) => ({ params: { ...state.params, ...partial } })),
  resetParams: () => set({ params: DEFAULT_PARAMS }),

  imageFile: null,
  setImageFile: (file) => set({ imageFile: file }),

  capacity: null,
  setCapacity: (capacity) => set({ capacity }),

  message: '',
  setMessage: (message) => set({ message }),

  encodeResult: null,
  setEncodeResult: (result) => set({ encodeResult: result }),

  decodeResult: null,
  setDecodeResult: (result) => set({ decodeResult: result }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),

  resetOperation: () =>
    set({
      imageFile: null,
      capacity: null,
      message: '',
      encodeResult: null,
      decodeResult: null,
      isLoading: false,
      error: null,
    }),
}));