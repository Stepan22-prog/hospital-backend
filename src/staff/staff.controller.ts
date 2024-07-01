import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
// import { CreateScheduleDto } from './dto/create-schedule.dto';
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  // @Roles(Role.Admin)
  // @UseGuards(RoleGuard)
  // @Post('/schedule')
  // createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
  //   return this.staffService.create(createScheduleDto);
  // }

  @Get()
  findAll() {
    // return this.staffService.findAll();
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOneById(id);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
