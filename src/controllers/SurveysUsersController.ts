import { EntityRepository } from "typeorm";
import { SurveyUser } from "../models/SurveyUser";

@EntityRepository(SurveyUser)
class SurveysUsersController {

}

export { SurveysUsersController };