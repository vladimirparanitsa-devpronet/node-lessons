var express = require('express');
var router = express.Router();

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
    }
  });
});

router.post('/order', (req, res, next) => {
  
});

module.exports = router;
