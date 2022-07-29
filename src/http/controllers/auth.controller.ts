import { Request, Response } from 'express';
import { GET, POST, route } from 'awilix-express';
import AuthService from '../../services/auth.service';
import { HttpStatusCode } from '../../commons/enums/http-startus-code.enum';

@route('/auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @route('/registration')
  @POST()
  public async registration(req: Request, res: Response): Promise<void> {
    const data = await this.authService.registration(req.body);
    res.status(HttpStatusCode.CREATED).json(data);
  }

  @route('/login')
  @POST()
  public async login(req: Request, res: Response): Promise<void> {
    const data = await this.authService.login(req.body);
    res.status(HttpStatusCode.OK).json(data);
  }

  @route('/logout')
  @POST()
  public async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json('ddd');
  }

  @route('/verify/:link')
  @GET()
  public async verify(req: Request, res: Response): Promise<void> {
    res.status(200).json('ddd');
  }

  @route('/password-forgot')
  @GET()
  public async passwordForgot(req: Request, res: Response): Promise<void> {
    res.status(200).json('ddd');
  }

  @route('/password-reset')
  @POST()
  public async passwordReset(req: Request, res: Response): Promise<void> {
    res.status(200).json('ddd');
  }

  @route('/refresh')
  @GET()
  public async refresh(req: Request, res: Response): Promise<void> {
    res.status(200).json('ddd');
  }
}
