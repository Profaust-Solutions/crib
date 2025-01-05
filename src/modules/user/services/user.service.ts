import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';

@Injectable()
export class UserService {
  constructor(
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
  public findAll = (options: IPaginationOptions) =>
    from(paginate<User>(this.userRepository, options));
  public findOne = (id: string) => from(this.userRepository.findOneBy({ id }));
  public findByUsername = (username: string) => from(this.userRepository.findOneBy({ username }));
  public delete = (userId: string) => from(this.userRepository.delete(userId));
  //public softDelete = (user: User) => from(this.userRepository.update(user.id, user));

  public softDelete(userId: string) {
    this.userRepository.update(userId, { soft_delete: true });
    return from(this.userRepository.softDelete(userId));
  }
}
