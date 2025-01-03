import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendMailParam } from './notifications.type';
import { FindAllNotificationsDto } from './dto/find-all-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  async sendMail({ message, from, to, subject }: SendMailParam) {
    try {
      await this.mailService.sendMail({
        from: `Hospital ${from ? '| ' + from : ''} <hospital@gmail.com>`,
        to,
        subject,
        html: message,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const createNotificationPromise = this.prisma.notifications.create({
      data: {
        subject: createNotificationDto.subject,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        sender: {
          connect: {
            id: createNotificationDto.senderId,
          },
        },
        receiver: {
          connect: {
            id: createNotificationDto.receiverId,
          },
        },
      },
    });

    if (createNotificationDto.sendOnEmail) {
      const receiverEmail = await this.getUserEmail(
        createNotificationDto.receiverId,
      );
      if (receiverEmail) {
        const sendMailPromise = this.sendMail({
          message: createNotificationDto.message,
          to: receiverEmail,
          subject: createNotificationDto.subject,
        });
        const [message] = await Promise.all([
          createNotificationPromise,
          sendMailPromise,
        ]);
        return message;
      }
      return;
    }
    return await createNotificationPromise;
  }

  async findAll({
    receiverId,
    isRead,
    page = 1,
    take = 1,
  }: FindAllNotificationsDto) {
    const conditions = {
      receiverId,
      isRead,
    };

    const notifications = await this.prisma.notifications.findMany({
      where: conditions,
      include: {
        sender: {
          select: {
            name: true,
            surname: true,
          },
        },
        receiver: {
          select: {
            name: true,
            surname: true,
          },
        },
      },
      skip: (page - 1) * take,
      take,
    });

    const totalCount = await this.prisma.notifications.count({
      where: conditions,
    });

    return {
      data: notifications,
      pagination: {
        page,
        take,
        total: totalCount,
      },
    };
  }

  async markAsRead(notificationId: string) {
    await this.prisma.notifications.updateMany({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async remove(notificationId: string) {
    await this.prisma.notifications.delete({
      where: {
        id: notificationId,
      },
    });
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
      },
    });
    return user?.email || null;
  }
}
