import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { REQUEST } from '@nestjs/core';
const bcrypt = require('bcrypt');
@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(User) public readonly userRepository: Repository<User>,
  ) {
    //super(userRepository, { useSoftDelete: true })
  }
  public create(user: User): Observable<User> {
    const createdUser = this.userRepository.create(user);
    return from(this.userRepository.save(createdUser));
  }
  public update = (user: User) =>
    from(this.userRepository.update(user.id, user));

  public updatePassword(id: String, password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    password = hash;
    return from(this.userRepository.update(id.toString(), { password }));
  }
  public findAll = (options: IPaginationOptions) =>
    from(paginate<User>(this.userRepository, options));
  public findOne = (id: string) => from(this.findUser(id));
  public findByUsername = (username: string) =>
    from(this.userRepository.findOneBy({ username }));
  public findByMobileNumber = (mobile_number: string) =>
    from(this.userRepository.findOneBy({ mobile_number }));
  public findByEmail = (email: string) =>
    from(this.userRepository.findOneBy({ email }));
  public delete = (userId: string) => from(this.userRepository.delete(userId));
  //public softDelete = (user: User) => from(this.userRepository.update(user.id, user));

  public softDelete(userId: string) {
    this.userRepository.update(userId, { soft_delete: true });
    return from(this.userRepository.softDelete(userId));
  }

  findUser(id: string) {
    //if user role is admin
    //return data for user id
    const userRole = this.request['user']['role'];
    const userId = this.request['user']['id'];
    if (userRole.toUpperCase() == 'admin'.toUpperCase()) {
      return this.userRepository.findOneBy({ id });
    }
    return this.userRepository.findOneBy({ id: userId });
  }

  public updatePartial(user: Partial<User> & { id: string }) {
    return from(this.userRepository.update(user.id, user));
  }
}
