// 1) Знайти всіх дітей в яких сердня оцінка 4.2
db.getCollection('students').find({avgScore : 4.2});
// 2) Знайди всіх дітей з 1 класу
db.getCollection('students').find({class : 1})
// 3) Знайти всіх дітей які вивчають фізику
db.getCollection('students').find({lessons : 'physics'})
// 4) Знайти всіх дітей, батьки яких працюють в науці ( scientist )
db.getCollection('students').find({'parents.profession' : 'scientist'})
// 5) Знайти дітей, в яких середня оцінка більша за 4
db.getCollection('students').find({avgScore : {$gt : 4}})
// 6) Знайти найкращого учня
db.getCollection('students').find({}).sort({avgScore : -1}).limit(1)
// 7) Знайти найгіршого учня
db.getCollection('students').find({}).sort({avgScore : 1}).limit(1)
// 8) Знайти топ 3 учнів
db.getCollection('students').find({}).sort({avgScore : -1}).limit(3)
// 9) Знайти середній бал по школі
db.getCollection('students').aggregate([
    {$group : {
        '_id' : 0,
        sumAvg : {
            $avg : '$avgScore'}
        }
    }])
// 10) Знайти середній бал дітей які вивчають математику або фізику
db.getCollection('students').aggregate([
    {$match : {$or : [{lessons : 'physics'}, {lessons : 'mathematics'}]}},
    {$group : {
        '_id' : 'MathAndPhys',
        sumAvg : {
            $avg : '$avgScore'},
        }
    }])
// 11) Знайти середній бал по 2 класі
db.getCollection('students').aggregate([
    {$group : {
        '_id' : '$class',
        sumAvg : {
            $avg : '$avgScore'}
        }
    },
    {$match : {
        '_id' :{$eq : 2}
        }}
    ])
// 12) Знайти дітей з не повною сімєю
// Один родитель
db.getCollection('students').find({parents : {$size : 1}});
// Сироты
db.getCollection('students').find({parents : {$exists : false}});


// 13) Знайти батьків які не працюють
// Находит весь обьект parents
db.getCollection('students').find(
    {$or : 
        [ {$and :  
            [ {'parents.0.profession' : {$exists : false}}, 
               {'parents.0' : {$exists : true}}, 
            ]},
        
          {$and :  
            [ {'parents.1.profession' : {$exists : false}}, 
               {'parents.1' : {$exists : true}}, 
            ]}
        ]}, 
    {'parents' : true});
// Находит отдельного parents
    db.getCollection('students').aggregate([
        {$unwind : '$parents'},
        {$match : {'parents.profession' : {$exists : false}}},
        {$group : {
            '_id' : '$parents'
            }}
    ])

// 14) Не працюючих батьків влаштувати офіціантами
// Без изменений в БД
// db.getCollection('students').aggregate([
//     {$unwind : '$parents'},
//     {$match : {'parents.profession' : {$exists : false}}},
//     {$group : {
//         '_id' : '$parents'
//         }},
//     {$set : {'parents.profession' : 'waiter'}}
// ])

db.getCollection('students').update(
    {$and :  
       [ {'parents.profession' : null}, 
          {parents : {$ne : null}}, 
       ]},
{$set : {'parents.$.profession' : 'waiter'}},
{multi : true}
)

// 15) Вигнати дітей, які мають середній бал менше ніж 2.5
// Выгоняем путем добавления нового поля
db.getCollection('students').update(
    {avgScore : {$lt : 2.5}},
    {$set : {'remove' : true}},
    {multi: true}
  )
// Выгоняем полным удалением элемента
db.getCollection('students').remove({avgScore : {$lt : 2.5}},{justOne : false})
// 16) Дітям, батьки яких працюють в освіті ( teacher ) поставити 5
db.getCollection('students').update(
    {'parents.profession' : 'teacher'},
    {$set : {'avgScore' : 5}},
    {multi: true}
  )
// 17) Знайти дітей які вчаться в початковій школі (до 5 класу) і вивчають фізику ( physics )
// Variant_1
db.getCollection('students').find({
    $and : [{'class' : {$lt : 5}}, {lessons : 'physics'}]        
    })
// Variant_2  
db.getCollection('students').find({
    class : {$lt : 5}, lessons : 'physics'       
 })    
// 18) Знайти найуспішніший клас
db.getCollection('students').aggregate([
    {$group : {
        '_id' : '$class',
        classRate: {
            $avg : '$avgScore'}
        }
    },
    {$sort : {classRate : -1}},
    {$limit : 1}
    ])

// ? Почему при эквивалентных значениях ключей второй вариант работает рандомно
db.getCollection('students').find({
    $and : [{lessons : 'physics'}, {lessons : 'mathematics'}]})
    
db.getCollection('students').find({lessons : 'physics', lessons : 'mathematics'})