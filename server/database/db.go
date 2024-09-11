package database

func Initialize() {
	connectSingleStore()
	connectSnowflake()
}
