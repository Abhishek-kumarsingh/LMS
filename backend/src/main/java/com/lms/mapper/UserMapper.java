package com.lms.mapper;

import com.lms.dto.user.UserDto;
import com.lms.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    @Mapping(target = "fullName", expression = "java(user.getFullName())")
    UserDto toDto(User user);
    
    User toEntity(UserDto userDto);
}
