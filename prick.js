let random_age = 0


while( random_age < 2_000_000) {
 random_age = Math.ceil(Math.random() * 9000155);
 console.log({
  message: random_age > 2_000_000 ? 'greater' : 'less',
  age: random_age 
 })
}