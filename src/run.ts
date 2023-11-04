import { SmartHomeHelper } from "./helpers/smart-home-helper";

(async () => {
  const home = new SmartHomeHelper();
  await home.init()
  await home.start();
})();