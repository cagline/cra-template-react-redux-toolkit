import prodConfig from "./prodConfig";
import devConfig from "./devConfig";
import AppConfig from "./AppConfig";

const index: AppConfig = process.env.NODE_ENV === `development` ? devConfig : prodConfig;
console.log('AppConfig', 'process.env.NODE_ENV', process.env.NODE_ENV);
console.log('AppConfig', `config.env : `,`${index.env}`);
console.log('AppConfig', `config.api.baseUrl: `,`${index.baseUrl}`);

export default index;

