create database book_management;
use book_management;
create table book (
    id int primary key auto_increment,
    title varchar(250) not null,
    author varchar(250) not null,
    isbn varchar(250) unique not null,
    publicatio_year int,
    genre varchar(250),
    created_at timestamp default current_timestamp ,
    updated_at timestamp default current_timestamp on update
    current_timestamp
)