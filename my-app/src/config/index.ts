import prodConfig from "./prodConfig";
import devConfig from "./devConfig";
import type { AppConfig } from "./AppConfig";

const index: AppConfig = import.meta.env.MODE === `development` ? devConfig : prodConfig;
console.log('AppConfig', 'import.meta.env.MODE', import.meta.env.MODE);
console.log('AppConfig', `config.env : `,`${index.env}`);
console.log('AppConfig', `config.api.baseUrl: `,`${index.baseUrl}`);

export default index;

