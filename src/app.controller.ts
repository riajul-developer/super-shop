import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AppService } from './app.service';
import { File } from '@nest-lab/fastify-multer'; 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('picture', { dest: './uploads' }))
  uploadFormData(
    @UploadedFile() picture: File, 
    @Body() body: { name: string; email: string },
  ) {
    console.log('Uploaded file:', picture);
    console.log('Form data:', body);
    return {
      message: 'Form data and file uploaded successfully',
      data: {
        name: body.name,
        email: body.email,
        picture,
      },
    };
  }


  @Post('upload-rows')
  @ApiBody({
    description: 'Multiple row data input',
    schema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
        },
      },
    },
  })
  uploadRowsData(
    @Body() body: { rows: Array<{ name: string; email: string }> },
  ) {
    console.log('Row data:', body.rows);

    return {
      message: 'Row data uploaded successfully',
      data: body.rows,
    };
  }
}


// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }
