const express = require('express');
const validator = require('validator');
const nodePhone = require('phone');
const router = express.Router();

router.post('/order', (req, res, next) => {
  res.render('order', {});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  let object = {
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
          '',
          'Молоко',
          'Хлеб',
          'Картошка',
          'Курица',
          'Соль',
        ]
      },
      submit: 'Заказать',
    }
  };

  if (req.error) {
    object.error = req.error;
  }
console.log(req.error);
  res.render('home', object);
});

router.post('/order', (req, res, next) => {
  res.end('Order is complete');
});

module.exports = router;
