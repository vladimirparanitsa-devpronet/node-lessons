const express = require('express');
const validator = require('validator');
const router = express.Router();

router.post('/order', (req, res, next) => {

  const {name, surname, phone, email, product} = req.body;

  const fieldEmpty = [name, surname, phone, email, product].some((field) => {
    return validator.isEmpty(field);
  });

  switch (true) {
    case ! fieldEmpty:
      req.error = {message: 'Вы не заполнили все обязательные поля'};
      next();
      break;
    case ! validator.isMobilePhone(phone, 'ru-RU'):
      req.error = {message: 'Не верный формат телефона'};
      next();
      break;
    case ! validator.isEmail(email):
      req.error = {message: 'Не верный email'};
      next();
      break;
  }

  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', {
    pageTitle: 'Заказ продуктов',
    formTitle: 'Закажите продукты используя форму ниже',
    formData: {
      name: 'Имя',
      surname: 'Фамилия',
      email: 'Email',
      phone: 'Телефон',
      products: {
        name: 'Продукт',
        values: [
          'Молоко',
          'Хлеб',
          'Картошка',
          'Курица',
          'Соль',
        ]
      },
      submit: 'Заказать',
    }
  });
});

router.post('/order', (req, res, next) => {
  res.end('Order is complete');
});

module.exports = router;
