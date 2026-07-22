import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from './current-user.interface';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: ICurrentUser }>();

    const currentUser: ICurrentUser = {
      id: 'default-user-1',
      name: 'Default user 1',
      email: 'default-user-1@gmail.com',
    };

    request.user = currentUser;
    return true;
  }
}
