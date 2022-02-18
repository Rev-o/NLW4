import { Request, Response } from 'express';
import { getCustomRepository } from "typeorm";
import { UsersRepository } from '../repositories/UsersRepository';
import * as yup from 'Yup';
import { AppError } from '../errors/AppError';

class UserController {

    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required()
        })

        try {
            await schema.isValid(request.body);
        } catch (err) {
            throw new AppError(err);
        }

        const usersRepository = getCustomRepository(UsersRepository);

        const userAlredyExists = await usersRepository.findOne({ email });

        if (userAlredyExists) {
            throw new AppError("User already exists");
        }
        const user = usersRepository.create({
            name, email
        });

        //retorna promise, então await
        await usersRepository.save(user);
        return response.status(201).json(user);
    }
}

export { UserController };
