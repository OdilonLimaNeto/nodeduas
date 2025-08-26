import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Role } from "@/common/enums/role.enum";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  async findAll(@Query("includeInactive") includeInactive?: string) {
    const includeInactiveFlag = includeInactive === "true";
    return this.productsService.findAll(includeInactiveFlag);
  }

  @Public()
  @Get("featured")
  async findFeatured() {
    return this.productsService.findFeatured();
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/deactivate")
  async deactivate(@Param("id") id: string) {
    return this.productsService.deactivate(id);
  }

  @Roles(Role.ADMIN)
  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.productsService.activate(id);
  }
}
