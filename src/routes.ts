import * as Router from 'koa-router';

const router = new Router();

router.get('/:name', async ctx => {
    console.log('I am inside the router');
    ctx.body = `Hello ${ctx.params.name}!`;
});

export const routes = router.routes();
