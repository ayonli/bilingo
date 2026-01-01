package models

type Author struct {
	User      User    `json:"user" gorm:"foreignKey:Email;references:Email;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Email     string  `json:"email" gorm:"primaryKey"`
	Bio       *string `json:"bio"`
	Publisher *string `json:"publisher"`
}
