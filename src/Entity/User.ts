import { Field, ObjectType, ID } from "type-graphql";
import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  OneToOne,
  BeforeInsert,
  JoinColumn,
} from "typeorm";

// TODO: Drop Table before working

@ObjectType()
@Entity()
export class Login extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn("uuid")
  id: string = "";

  @Field()
  @Column({ unique: true })
  username: string = "";

  @Field()
  @Column()
  passwordHash: string = "";

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn("uuid")
  id: string = "";

  @Field()
  @Column()
  firstName: string = "";

  @Field()
  @Column()
  lastName: string = "";

  @Field()
  @Column()
  email: string = "";

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }

  @OneToOne(() => Login)
  @JoinColumn()
  login: Login = new Login();
}

@ObjectType()
export class UserResponse {
  constructor(success: boolean, message: string, user: User | undefined) {
    this.success = success;
    this.message = message;
    if (user !== undefined) {
      this.user = user;
    }
  }

  @Field()
  success: boolean = false;

  @Field({ nullable: true })
  message: string = "";

  @Field({ nullable: true })
  user: User = new User();
}

@ObjectType()
export class LoginResponse {
  constructor(success: boolean = false, message: string = "login failed") {
    this.success = success;
    this.message = message;
  }

  @Field()
  success: boolean = false;

  @Field({ nullable: true })
  message: string = "";
}
