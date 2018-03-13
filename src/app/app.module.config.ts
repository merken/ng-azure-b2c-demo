import { ConfigService } from "./services/config.service";

export function ConfigLoader(configService: ConfigService) {
    return () => configService.loadEnvironmentConfig();
}
