declare module '*.json' {
  const value: any;
  export default value;
}

declare module '@env' {
  export const API_URL: string;
  export const CONTENT_NFT_ADDRESS: string;
}
