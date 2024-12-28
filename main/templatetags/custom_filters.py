from django import template

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """Get the value for the key in the dictionary."""
    return dictionary.get(key)


@register.filter
def split(value, delimiter=','):
    """split the string by the given delimiter"""
    return value.split(delimiter)