package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"sync"

	_ "github.com/libsql/libsql-client-go/libsql"
)

type Database struct {
	db *sql.DB
}

func (database Database) GetDB() *sql.DB {
	return database.db
}

var databaseInstance *Database
var lock = &sync.Mutex{}

func GetInstance() *Database {
	lock.Lock()
	defer lock.Unlock()

	if databaseInstance == nil {
		db, dbErr := sql.Open("libsql", os.Getenv("DB_STRING"))

		if dbErr != nil {
			log.Fatal(dbErr.Error())
		}

		if connErr := db.Ping(); connErr != nil {
			log.Fatal(connErr)
		}
		fmt.Println("Connected to the database")
		databaseInstance = &Database{db}
		databaseInstance.Init()

	}
	return databaseInstance
}

func (database *Database) Init() {
	database.GetDB().Exec("CREATE TABLE IF NOT EXISTS `users` (`id` integer,`first_name` text,`email` text,`password` blob,`role` integer,PRIMARY KEY (`id`))")
	database.GetDB().Exec("CREATE TABLE IF NOT EXISTS `tokens` (`id` integer,`token_value` text,`user_refer` integer,`kind` integer,PRIMARY KEY (`id`),CONSTRAINT `fk_users_tokens` FOREIGN KEY (`user_refer`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE)")
}
