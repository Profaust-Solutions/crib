import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, switchMap } from 'rxjs';
import { User } from 'src/modules/user/models/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import { Repository } from 'typeorm';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  private userId: string;

  getUserId(): string {
    return this.userId || '';
  }

  setUserId(id: string) {
    this.userId = id;
  }

  constructor(
    @Inject(UserService) public readonly userService: UserService,
    public readonly jwtService: JwtService,
  ) {}

  public loginWithUsernameAndPassword(
    username: string,
    password: string,
  ): Observable<any> {
    return from(this.userService.findByUsername(username)).pipe(
      switchMap((user) => {
        if (!user) {
          return of(false);
        }
        return this.comparePasswords(password, user.password).pipe(
          switchMap((isValid) => {
            if (!isValid) {
              return of(false);
            }
            const jwtUser = {
              username: user.username,
              email: user.email,
              id: user.id,
              role: user.role,
              fullname: user.fullname,
            };
            return this.generateAccessToken(jwtUser).pipe(
              switchMap((token) => {
                jwtUser['token'] = token;
                return of(jwtUser);
              }),
            );
          }),
        );
      }),
    );
  }

  public hashPassword(password: string): Observable<string> {
    bcrypt.hash(password, 10, function (err, hash) {
      return of(hash);
    });

    return;
  }

  public comparePasswords(
    newPassword: string,
    hashedPassword: string,
  ): Observable<any | boolean> {
    return of<any | boolean>(bcrypt.compareSync(newPassword, hashedPassword));
  }

  public generateAccessToken(data: any): Observable<string> {
    return from(
      this.jwtService.signAsync({
        data,
      }),
    );
  }

  public refreshToken(userId: string): Observable<any> {
    return from(this.userService.findOne(userId)).pipe(
      switchMap((user) => {
        if (!user) {
          return of(false);
        }
        const jwtUser = {
          username: user.username,
          email: user.email,
          id: user.id,
          role: user.role,
          fullname: user.fullname,
        };
        return this.generateAccessToken(jwtUser);
      }),
    );
  }
}
