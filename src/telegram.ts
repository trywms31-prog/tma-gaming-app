import {
  expandViewport,
  init,
  initDataRaw,
  initDataUser,
  isTMA,
  miniAppReady,
  mockTelegramEnv,
  mountViewport,
  restoreInitData,
  retrieveRawInitData,
  setMiniAppBackgroundColor,
  setMiniAppHeaderColor,
} from "@telegram-apps/sdk";

export type BootResult = {
  initDataRaw: string;
  user: {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    photo_url?: string;
  } | null;
};

export async function bootstrapTelegram(): Promise<BootResult> {
  const inTelegram = isTMA();
  if (!inTelegram) {
    mockTelegramEnv({
      launchParams: {
        tgWebAppPlatform: "tdesktop",
        tgWebAppVersion: "8.0",
        tgWebAppThemeParams: {
          bg_color: "#07060f",
          text_color: "#ffffff",
          button_color: "#b56bff",
        },
      },
    });
  }

  init();
  restoreInitData();

  if (mountViewport.isAvailable()) {
    await mountViewport();
  }
  if (expandViewport.isAvailable()) {
    expandViewport();
  }
  if (miniAppReady.isAvailable()) {
    miniAppReady();
  }
  if (setMiniAppHeaderColor.isAvailable()) {
    setMiniAppHeaderColor("#07060f");
  }
  if (setMiniAppBackgroundColor.isAvailable()) {
    setMiniAppBackgroundColor("#07060f");
  }

  const raw = retrieveRawInitData() || initDataRaw() || window.Telegram?.WebApp?.initData || "";
  const user = initDataUser() || window.Telegram?.WebApp?.initDataUnsafe?.user || null;

  return { initDataRaw: raw, user };
}
