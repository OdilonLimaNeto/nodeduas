import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";

@Controller()
export class HealthController {
  @Get("health")
  @Public()
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "no-de-duas-api",
    };
  }
}
