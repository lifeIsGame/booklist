import { httpPost, route, nonRoutable } from 'easy-express-controllers';
import SubjectDAO from '../dataAccess/subjectDAO';

class subjectController{
    constructor(){}
    async all(){
        let subjectDao = new SubjectDAO(this.request.user.id),
            subjects = await subjectDao.loadSubjects();

        this.send({ results: subjects })
    }
    @httpPost
    async setInfo(_id, newName, newParent){
        let subjectDao = new SubjectDAO(this.request.user.id),
            { affectedSubjects } = await subjectDao.updateSubjectInfo(_id, newName, newParent || null);

        this.send({ affectedSubjects });
    }
    @httpPost
    async delete(_id){
        let subjectDao = new SubjectDAO(this.request.user.id);
        let { booksUpdated } = await subjectDao.deleteSubject(_id);
        this.send({ success: true, booksUpdated });
    }
}

export default subjectController;