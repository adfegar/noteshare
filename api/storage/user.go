package storage

import (
	"database/sql"
	"errors"
	"noteshare-api/database"
	"noteshare-api/models"
)

type UserStorage struct{}

const userTypeMismatchErr = "must be type user"
const UserNotFoundErr = "user not found"

func (userStorage *UserStorage) Get(id int) (interface{}, error) {
	database := database.GetInstance().GetDB()

	result, err := database.Query("SELECT * FROM users where id = ? ;", id)

	if err != nil {
		return nil, err
	}
	defer result.Close()

	if result.Next() {
		user, scanErr := userStorage.Scan(result)
		if scanErr != nil {
			return nil, scanErr
		}

		return user.(*models.User), nil
	} else {
		return nil, errors.New(UserNotFoundErr)
	}
}

func (userStorage *UserStorage) Create(item interface{}) error {
	user, ok := item.(*models.User)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?);", user.UserName, user.Email, user.Password, user.Role)

	if err != nil {
		return err
	}

	// Set the user id to the database generated id
	userId, idErr := result.LastInsertId()

	if idErr != nil {
		return idErr
	}

	user.ID = uint(userId)

	return err
}

func (userStorage *UserStorage) Update(item interface{}) error {
	user, ok := item.(*models.User)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}
	database := database.GetInstance().GetDB()
	result, err := database.Exec("UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ? ;",
		user.UserName, user.Email, user.Password, user.Role, user.ID)

	if err != nil {
		return err
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		return errors.New(UserNotFoundErr)
	}

	return nil
}

func (userStorage *UserStorage) Delete(item interface{}) error {
	user, ok := item.(*models.User)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("DELETE FROM users WHERE id = ? ;", user.ID)

	if err != nil {
		return err
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		return errors.New(UserNotFoundErr)
	}
	return nil
}

func (userStorage *UserStorage) Scan(result *sql.Rows) (interface{}, error) {
	var user models.User

	if scanErr := result.Scan(&user.ID, &user.UserName, &user.Email, &user.Password, &user.Role); scanErr != nil {
		return nil, scanErr
	}
	return &user, nil
}
