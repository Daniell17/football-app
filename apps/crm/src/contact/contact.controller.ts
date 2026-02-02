import { Controller, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared';

@ApiTags('admin-contact')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contact messages' })
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact message by ID' })
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a contact message as read' })
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact message' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
