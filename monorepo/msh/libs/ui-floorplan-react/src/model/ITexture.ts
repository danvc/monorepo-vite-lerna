export interface ITexture {
  url: string;
  stretch: boolean;
  scale: number;
}

export type TEXTURE_MAP = {
  [key: string]: ITexture;
};
