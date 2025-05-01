import Router from 'express';
import { getPendingCertificates, getAllRequestes,approveCertificate } from '../Controllers/certificate.controller.js';

const router = Router();

router.route('/pending').get(getPendingCertificates);
router.route('/all').get(getAllRequestes);
router.route('/update/:certificateId').put(approveCertificate);

export default router;