import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { getRepository, getManager } from "typeorm";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Login, LoginResponse, User, UserResponse } from "../Entity/User";

@Resolver()
export class UserResolver {
  @Query(() => LoginResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    const user = await getRepository(User)
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.login", "l")
      .where("l.username = :username", { username: username })
      .getOne();

    if (user === undefined) {
      return new LoginResponse();
    }

    try {
      if (await argon2.verify(user.login.passwordHash, password)) {
        const secret: string | undefined = process.env.SECRET;
        if (secret === undefined) {
          return new LoginResponse();
        }
        const jwtRet = jwt.sign(
          {
            data: {
              userId: user.id,
            },
          },
          secret,
          { expiresIn: "4h" }
        );
        return new LoginResponse(true, jwtRet);
      } else {
        return new LoginResponse();
      }
    } catch (err) {
      console.log(err);
    }
    return new LoginResponse();
  }

  @Mutation(() => UserResponse)
  async addOrCreateUser(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string
  ): Promise<UserResponse> {
    const entityManager = getManager();

    // TODO: UUID DOES NOT TRANSFER OVER. NEED TO FIGURE OUT WHAT TO DO.

    const user = await entityManager.findOne(User, {
      firstName: firstName,
      lastName: lastName,
      email: email,
    });

    if (user !== undefined) {
      return new UserResponse(
        false,
        "User with this email already exists",
        undefined
      );
    }

    const login = await entityManager.findOne(Login, { username: username });
    if (login !== undefined) {
      return new UserResponse(false, "Username already exists", undefined);
    }

    let newLogin = new Login();
    newLogin.username = username;
    try {
      const hash = await argon2.hash(password);
      newLogin.passwordHash = hash;
    } catch (err) {
      throw new Error("Failed to hash");
    }

    await entityManager.insert(Login, newLogin);

    const newUser = new User();
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;

    newUser.login = newLogin;

    await entityManager.insert(User, newUser);

    return new UserResponse(true, "Success!", newUser);
  }
}
