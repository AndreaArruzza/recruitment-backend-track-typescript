import { UserRepositoryImpl } from "../repository/user.repository.impl";
import type {
  UserResponse,
  PaginatedUsers,
  PageParameter,
  PageSizeParameter,
  UserCreateRequest,
} from "../api/dto";
import { UserMapper } from "../mapper/user.mapper";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import type { PatchUserDto , AdminPutUserDto, UserFilter} from "../shared/dto/user.type.dto";
import { BadRequestError, ConflictError, NotFoundError } from "../error/http-errors";
import { UserService } from "./interface/user.service";
import {logger} from "../shared/logger";
import { PrismaClient } from "@prisma/client";

 

export class UserServiceImpl implements UserService {

  constructor(private  repository = new UserRepositoryImpl(),
  private prisma = new PrismaClient()) {}

  private log = logger.child({ module: "UserServiceImpl" });


  getAllUsers = async (
    userData: UserFilter,
    page: PageParameter,
    pageSize: PageSizeParameter
  ): Promise<PaginatedUsers> => {
    this.log.debug("repository findAll...");
    const pageResult = await this.repository.findAll(userData, page, pageSize);
    this.log.debug("repository findAll OK"); 
    return {
      ...pageResult,
      data: pageResult.data.map((user) => UserMapper.fromEntitytoUserResponse(user)),
    };
  };

  getUserById = async (id: bigint): Promise<UserResponse> => {
    const user = await this.repository.findById(id);
    this.log.debug("findById OK");
    if (!user) { 
      this.log.error("User Not Found, id =" + id  );
      throw new NotFoundError("User not found", "id => " + id.toString() )
    };
    return UserMapper.fromEntitytoUserResponse(user);
  };

  createUser = async (input: UserCreateRequest): Promise<{ id: string }> => {
    const { email, password, firstName, lastName, role, phone } = input;

    if (!email?.trim() || !password?.trim()) {
      this.log.error("Email and password are required. Email = " + email + "password = " + password );
      throw new BadRequestError("Email and Password are required");
    }

    const passwordHash = await bcrypt.hash(password, 10);
   
    return this.repository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      phone,
    } as Partial<User>);
  };

  updateUser = async (id: bigint, input: AdminPutUserDto) : Promise<UserResponse> => {
    const currentUser = await this.repository.findById(id);
    if (!currentUser) { 
      this.log.error("User Not Found, id =" + id  );
      throw new NotFoundError("User not found", "id => " + id.toString() )
    };

    let passwordHash: string | undefined = undefined;
    if (input.password) {
      passwordHash = await bcrypt.hash(input.password, 10);
    }

    if (input.email && input.email !== currentUser.email) {
       await this.checkEmailExists(input.email);
    }

    const updated = await this.repository.updateById(
      UserMapper.createAdminPutUserDto(input, currentUser, passwordHash)
    );

    return UserMapper.fromEntitytoUserResponse(updated);
  }

  
  patchUser = async (id: bigint, input: PatchUserDto) => {
    const currentUser = await this.repository.findById(id);
    if (!currentUser) { 
      this.log.error("User Not Found, id =" + id  );
      throw new NotFoundError("User not found", "id => " + id.toString() )
    };
        if (Object.keys(input).length === 0) currentUser;

    const updated = await this.repository.updateById(
      UserMapper.createPatchUserDto(input, currentUser)
    );

    return UserMapper.fromEntitytoUserResponse(updated);
  }
  

  deleteUser = async (id: bigint): Promise<void> => {
    const currentUser = await this.repository.findById(id);
    if (!currentUser) { 
      this.log.error("User Not Found, id =" + id  );
      throw new NotFoundError("User not found", "id => " + id.toString() )
    };
    await this.repository.deleteById(id);
  }

  private checkEmailExists = async (email: string): Promise<void> => {
    const existing = await this.repository.findByEmailRaw(email);
    if (existing) { 
      this.log.error("Email already in use");
      new ConflictError("Email already in use", "email => " + email );
    };
  }
}
