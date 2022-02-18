import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;
        const userRepository = getCustomRepository(UsersRepository);
        const surveyRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await userRepository.findOne({ email });

        if (!user) {
            throw new AppError("User does not exist");
        }

        const survey = await surveyRepository.findOne({ id: survey_id });

        if (!survey) {
            throw new AppError("survey does not exist");
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", "survey"]
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if (surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }
        //salvar na BD
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id
        });
        variables.id = surveyUser.id;
        await surveysUsersRepository.save(surveyUser);
        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json({ surveyUser });
    }
}

export { SendMailController }