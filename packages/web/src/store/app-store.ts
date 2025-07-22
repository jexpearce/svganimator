import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PrimitiveMap, SvgAnalysisResult } from '@motif/schema';

export type AnimationConfig<T extends keyof PrimitiveMap = keyof PrimitiveMap> = {
  type: T;
  options: PrimitiveMap[T];
};

interface AppState {
  // SVG Data
  svgString: string | null;
  svgMeta: SvgAnalysisResult | null;
  
  // Animation
  prompt: string;
  animationConfig: AnimationConfig | null;
  suggestedAnimations: AnimationConfig[];
  isPlaying: boolean;
  
  // UI State
  isUploading: boolean;
  isSuggesting: boolean;
  exportModalOpen: boolean;
  error: string | null;
  
  // Actions
  setSvgString: (svg: string) => void;
  setSvgMeta: (meta: SvgAnalysisResult) => void;
  setPrompt: (prompt: string) => void;
  setAnimationConfig: (config: AnimationConfig | null) => void;
  setSuggestedAnimations: (suggestions: AnimationConfig[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsUploading: (uploading: boolean) => void;
  setIsSuggesting: (suggesting: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  updateAnimationOption: <T extends keyof PrimitiveMap>(
    key: keyof PrimitiveMap[T],
    value: any
  ) => void;
}

const initialState = {
  svgString: null,
  svgMeta: null,
  prompt: '',
  animationConfig: null,
  suggestedAnimations: [],
  isPlaying: false,
  isUploading: false,
  isSuggesting: false,
  exportModalOpen: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    immer((set) => ({
      ...initialState,
      
      setSvgString: (svg) => set((state) => {
        state.svgString = svg;
        state.error = null;
      }),
      
      setSvgMeta: (meta) => set((state) => {
        state.svgMeta = meta;
      }),
      
      setPrompt: (prompt) => set((state) => {
        state.prompt = prompt;
      }),
      
      setAnimationConfig: (config) => set((state) => {
        state.animationConfig = config;
      }),
      
      setSuggestedAnimations: (suggestions) => set((state) => {
        state.suggestedAnimations = suggestions;
      }),
      
      setIsPlaying: (playing) => set((state) => {
        state.isPlaying = playing;
      }),
      
      setIsUploading: (uploading) => set((state) => {
        state.isUploading = uploading;
      }),
      
      setIsSuggesting: (suggesting) => set((state) => {
        state.isSuggesting = suggesting;
      }),
      
      setExportModalOpen: (open) => set((state) => {
        state.exportModalOpen = open;
      }),
      
      setError: (error) => set((state) => {
        state.error = error;
      }),
      
      reset: () => set(() => initialState),
      
      updateAnimationOption: (key, value) => set((state) => {
        if (state.animationConfig) {
          (state.animationConfig.options as any)[key] = value;
        }
      }),
    })),
    {
      name: 'motif-app-store',
    }
  )
); 