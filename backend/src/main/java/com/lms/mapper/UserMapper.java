package com.lms.mapper;

import com.lms.dto.user.UserDto;
import com.lms.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    UserDto toDto(User user);

    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "certificates", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "courses", ignore = true)
    @Mapping(target = "earnings", ignore = true)
    @Mapping(target = "enrollments", ignore = true)
    @Mapping(target = "github", ignore = true)
    @Mapping(target = "linkedin", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "resetPasswordExpires", ignore = true)
    @Mapping(target = "resetPasswordToken", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "twitter", ignore = true)
    @Mapping(target = "verificationToken", ignore = true)
    @Mapping(target = "website", ignore = true)
    @Mapping(target = "wishlists", ignore = true)
    User toEntity(UserDto userDto);
}
