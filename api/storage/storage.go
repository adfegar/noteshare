package storage

import "database/sql"

type Storage interface {
	Get(int) (interface{}, error)
	Create(interface{}) error
	Update(interface{}) error
	Delete(interface{}) error
	Scan(*sql.Rows) (interface{}, error)
}
